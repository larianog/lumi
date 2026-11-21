"""
Laboratório de testes de risco — newDirections / UNMUTE by Agora.

Servidor mínimo (FastAPI) que:
  - entrega a página de teste (static/index.html);
  - gera tokens RTC + RTM para o navegador;
  - inicia e para o agente de voz da Agora com as configurações escolhidas na página;
  - mostra o JSON exato enviado à Agora (/api/preview), para depurar.

Rodar:  .venv\\Scripts\\python -m uvicorn server:app --port 3000
Abrir:  http://localhost:3000   (precisa ser "localhost" para o navegador liberar o microfone)
"""

from __future__ import annotations

import base64
import copy
import os
import pathlib
import time
import warnings
from typing import Any, Dict, List, Optional

warnings.filterwarnings("ignore", category=UserWarning)  # avisos de pydantic do SDK

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import agora_agent as ag

HERE = pathlib.Path(__file__).parent
load_dotenv(HERE / ".env")

APP_ID = os.environ.get("AGORA_APP_ID", "").strip()
APP_CERTIFICATE = os.environ.get("AGORA_APP_CERTIFICATE", "").strip()
LEMONSLICE_API_KEY = os.environ.get("LEMONSLICE_API_KEY", "").strip()
ANAM_API_KEY = os.environ.get("ANAM_API_KEY", "").strip()
ANAM_AVATAR_ID = os.environ.get("ANAM_AVATAR_ID", "").strip()
ANAM_READY = bool(ANAM_API_KEY and ANAM_AVATAR_ID)
AREA = os.environ.get("AGORA_AREA", "US").strip().upper()

AGENT_UID = "1001"
USER_UID = 1002
AVATAR_UID = "2001"
# Imagem do personagem: mascote.png ou mascote.jpg (usa a primeira que existir)
MASCOT_FILE = next((p for p in (HERE / "mascote.png", HERE / "mascote.jpg", HERE / "mascote.jpeg") if p.exists()), HERE / "mascote.png")

DEFAULT_INSTRUCTIONS = """Você é o Pipo, um personagem amigável que ajuda crianças brasileiras de 4 a 8 anos a aprender inglês brincando.
Regras:
- Fale principalmente em português, simples e curto (no máximo 2 frases por vez).
- Ensine UMA palavra em inglês por vez, devagar, e peça para a criança repetir ("Can you say car?").
- Comemore toda tentativa. Corrija com carinho, nunca diga que está errado.
- Se a criança mostrar um objeto (imagem), diga o nome dele em inglês e faça uma pergunta sobre ele.
- Crianças fazem pausas e falam errado: tente entender a intenção, sem pedir para repetir toda hora.
- Segurança: nunca peça nome completo, endereço, escola ou fotos. Nunca proponha segredos.
  Em assunto sensível ou de adulto, diga: "Essa é uma ótima pergunta pro papai ou pra mamãe!".
"""
DEFAULT_GREETING = "Oi! Eu sou o Pipo! Hello! Vamos brincar de inglês? Me mostra um brinquedo!"


class Settings(BaseModel):
    # Reconhecimento de voz (ASR)
    asr: str = "deepgram-nova-3"          # deepgram-nova-3 | deepgram-nova-2 | ares
    asr_language: str = "pt-BR"           # pt-BR | multi | en-US | pt-PT (ARES só aceita pt-PT, não pt-BR)
    keywords: str = ""                    # palavras para reforçar (separadas por vírgula)
    # Fim de fala
    eos_mode: str = "vad"                 # vad | semantic (semantic só funciona em inglês/chinês)
    silence_ms: int = 1200
    max_wait_ms: int = 3000
    pause_state: bool = True
    # Ruído / outras vozes
    sal: bool = False
    # LLM
    llm_model: str = "gpt-4o-mini"        # gpt-4o-mini | gpt-4.1-mini | gpt-5-nano | gpt-5-mini
    vision: bool = True
    instructions: str = DEFAULT_INSTRUCTIONS
    greeting: str = DEFAULT_GREETING
    # Voz (TTS)
    tts: str = "openai"                   # openai | minimax
    tts_voice: str = "nova"               # openai: alloy, nova, shimmer...; minimax: voice_id
    tts_speed: float = 0.85               # 1.0 = normal; abaixo disso fala mais devagar (0.25 a 4.0 no OpenAI)
    # Trechos entre [colchetes] não são falados (4 = [ ]). O agente usa isso para marcar [CERTO]/[QUASE]/[ERRADO].
    tts_skip_patterns: list[int] = [4]
    minimax_model: str = "speech_2_6_turbo"
    # Avatar
    avatar: bool = False
    avatar_image_url: str = ""            # vazio = usa testes/lab/mascote.png
    avatar_aspect: str = "2x3"            # 2x3 é o recomendado pela LemonSlice
    avatar_model: str = "cartoon"         # "cartoon" para mascote/desenho; vazio = modelo padrão (humano)
    # Sessão
    idle_timeout: int = 60


class StartRequest(BaseModel):
    channel: str
    settings: Settings = Settings()


class StopRequest(BaseModel):
    agentId: str


class TokenRequest(BaseModel):
    channel: str
    uid: int = USER_UID


def _require_credentials() -> None:
    if not APP_ID or not APP_CERTIFICATE:
        raise HTTPException(
            status_code=500,
            detail="Faltam AGORA_APP_ID e AGORA_APP_CERTIFICATE no arquivo testes/lab/.env (veja .env.example).",
        )


def _client(app_id: str, app_certificate: str) -> "ag.Agora":
    area = getattr(ag.Area, AREA, ag.Area.US)
    return ag.Agora(area=area, app_id=app_id, app_certificate=app_certificate)


def build_agent(s: Settings, client: Any) -> Any:
    """Monta o agente a partir das configurações da página."""
    warnings_out: List[str] = []

    # --- fim de fala (turn detection) ---
    if s.eos_mode == "semantic":
        td: Dict[str, Any] = {
            "config": {
                "end_of_speech": {
                    "mode": "semantic",
                    "semantic_config": {
                        "silence_duration_ms": s.silence_ms,
                        "max_wait_ms": s.max_wait_ms,
                        "pause_state_enabled": s.pause_state,
                    },
                }
            }
        }
    else:
        td = {
            "config": {
                "end_of_speech": {
                    "mode": "vad",
                    "vad_config": {"silence_duration_ms": s.silence_ms},
                }
            }
        }

    # --- ASR ---
    kw = [k.strip() for k in s.keywords.split(",") if k.strip()]
    if s.asr == "ares":
        # ARES pega o idioma do turn_detection.language (lista do SDK tem pt-PT, não pt-BR)
        td["language"] = s.asr_language if s.asr_language in ("pt-PT", "en-US") else "pt-PT"
        stt = ag.AresSTT(keywords=kw or None)
    else:
        model = "nova-2" if s.asr == "deepgram-nova-2" else "nova-3"
        stt = ag.DeepgramSTT(model=model, language=s.asr_language, keyterm=",".join(kw) or None)

    # --- LLM ---
    llm = ag.OpenAI(
        model=s.llm_model,
        input_modalities=["text", "image"] if s.vision else ["text"],
        max_history=20,
    )

    # --- TTS ---
    if s.tts == "minimax":
        tts = ag.MiniMaxTTS(model=s.minimax_model, voice_id=s.tts_voice or "English_captivating_female1", speed=s.tts_speed)
    else:
        tts = ag.OpenAITTS(model="tts-1", voice=s.tts_voice or "nova", speed=s.tts_speed, skip_patterns=s.tts_skip_patterns or None)

    agent = (
        ag.Agent(
            client,
            instructions=s.instructions,
            greeting=s.greeting,
            failure_message="Ops, não entendi. Fala de novo?",
            max_history=20,
            turn_detection=td,
            advanced_features={"enable_rtm": True, "enable_sal": bool(s.sal)},
            sal={"sal_mode": "locking"} if s.sal else None,
            parameters={"data_channel": "rtm", "enable_metrics": True, "enable_error_message": True},
        )
        .with_stt(stt)
        .with_llm(llm)
        .with_tts(tts)
    )

    # --- Avatar (BYOK): Anam se houver ANAM_API_KEY + ANAM_AVATAR_ID, senão LemonSlice ---
    if s.avatar and ANAM_READY:
        agent = agent.with_avatar(
            ag.AnamAvatar(
                api_key=ANAM_API_KEY,
                avatar_id=ANAM_AVATAR_ID,
                additional_params={"agora_uid": AVATAR_UID},  # o SDK gera o token do vídeo do avatar
            )
        )
    elif s.avatar:
        if not LEMONSLICE_API_KEY:
            raise HTTPException(status_code=400, detail="Avatar ligado, mas faltam as chaves do avatar no .env (ANAM_API_KEY + ANAM_AVATAR_ID, ou LEMONSLICE_API_KEY).")
        img: Dict[str, str] = {}
        if s.avatar_image_url.strip():
            img["agent_image_url"] = s.avatar_image_url.strip()
        elif MASCOT_FILE.exists():
            img["agent_image_base64"] = base64.b64encode(MASCOT_FILE.read_bytes()).decode()
        else:
            raise HTTPException(
                status_code=400,
                detail="Avatar ligado: informe uma URL pública de imagem ou salve testes/lab/mascote.png.",
            )
        agent = agent.with_avatar(
            ag.LemonSlice(
                api_key=LEMONSLICE_API_KEY,
                api_base_url="https://lemonslice.com/api/liveai/agora",
                avatar_id="lemonslice",
                agora_uid=AVATAR_UID,
                aspect_ratio=s.avatar_aspect,
                additional_params={"model": s.avatar_model} if s.avatar_model else None,
                **img,
            )
        )
    return agent


def _session(agent: Any, channel: str, s: Settings) -> Any:
    return agent.create_session(
        channel=channel,
        agent_uid=AGENT_UID,
        remote_uids=[str(USER_UID)],
        name=f"lab-{int(time.time())}",
        idle_timeout=s.idle_timeout,
        expires_in=ag.expires_in_hours(1),
    )


def preview_properties(s: Settings, channel: str, app_id: str, app_certificate: str) -> Dict[str, Any]:
    """Monta o corpo do pedido à Agora sem enviá-lo (dry-run)."""
    sess = _session(build_agent(s, _client(app_id, app_certificate)), channel, s)
    skip, allow = sess._vendor_validation_categories(None)
    props = sess._build_start_properties(
        {"app_id": app_id, "app_certificate": app_certificate}, skip, allow
    )
    return _mask(props)


def _mask(obj: Any) -> Any:
    """Esconde tokens, chaves e imagens grandes antes de mostrar."""
    obj = copy.deepcopy(obj)

    def walk(o: Any) -> Any:
        if isinstance(o, dict):
            for k, v in list(o.items()):
                lk = k.lower()
                secret = lk in ("key", "token", "secret") or lk.endswith(("_token", "api_key", "_secret"))
                if secret and isinstance(v, str) and v:
                    o[k] = "***"
                elif lk.endswith("base64") and isinstance(v, str):
                    o[k] = f"<{len(v)} chars base64>"
                else:
                    walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
        return o

    return walk(obj)


app = FastAPI(title="newDirections · lab de riscos")


@app.get("/")
def index() -> FileResponse:
    # Tela simples: falar uma palavra e ver o que foi entendido.
    return FileResponse(HERE / "static" / "simples.html")


class Atividade(BaseModel):
    """Contexto que vem de fora: o que perguntar e qual é a resposta esperada."""
    pergunta: str = "Qual é o objeto?"    # pergunta única (usada se "perguntas" vier vazia)
    # Variações da pergunta: a página sorteia uma e, ao repetir, usa outra (menos robótico)
    perguntas: list[str] = [
        "Que objeto é esse?",
        "Qual é esse objeto?",
        "O que é isso?",
        "Você sabe o que é isso?",
        "Como se chama esse objeto?",
        "Qual é o nome desse objeto?",
        "O que você está vendo?",
        "Que objeto você está vendo?",
    ]
    resposta: str = "bola"                # a palavra/frase certa (variável da sessão)
    aceita: list[str] = []                # outras respostas certas (plural, sinônimo)
    alias: list[str] = []                 # como o ASR costuma escrever errado essa resposta
    imagem: str = "⚽"                     # URL de uma imagem, ou um emoji (⚽ 🐶 🚗) mostrado grande na tela
    lang: str = "pt-BR"                   # idioma da fala esperada: pt-BR, en-US ou multi
    avatar_img: str = ""                  # URL da imagem do personagem (avatar)


_ATIVIDADE = Atividade()


@app.get("/api/atividade")
def get_atividade() -> dict:
    return _ATIVIDADE.dict()


@app.post("/api/atividade")
def set_atividade(a: Atividade) -> dict:
    global _ATIVIDADE
    _ATIVIDADE = a
    return _ATIVIDADE.dict()


@app.get("/mascote")
def mascote() -> FileResponse:
    # Imagem do personagem, usada pela animação 2D da tela simples.
    if not MASCOT_FILE.exists():
        raise HTTPException(status_code=404, detail="Salve a imagem como testes/lab/mascote.jpg ou mascote.png")
    return FileResponse(MASCOT_FILE)


@app.get("/lab")
def lab() -> FileResponse:
    # Lab completo (configurações, cenários, avatar, câmera, métricas).
    return FileResponse(HERE / "static" / "index.html")


@app.get("/api/config")
def config() -> Dict[str, Any]:
    return {
        "appId": APP_ID,
        "ready": bool(APP_ID and APP_CERTIFICATE),
        "avatarReady": bool(LEMONSLICE_API_KEY) or ANAM_READY,
        "avatarVendor": "anam" if ANAM_READY else ("lemonslice" if LEMONSLICE_API_KEY else None),
        # Anam usa o avatar criado no painel deles, então não precisa de imagem aqui
        "mascotFile": MASCOT_FILE.exists() or ANAM_READY,
        "agentUid": AGENT_UID,
        "userUid": USER_UID,
        "avatarUid": AVATAR_UID,
        "defaults": Settings().dict(),
    }


@app.post("/api/token")
def token(body: TokenRequest) -> Dict[str, Any]:
    _require_credentials()
    tok = ag.generate_client_token(APP_ID, APP_CERTIFICATE, body.channel, body.uid, token_expire=3600)
    return {"token": tok}


@app.post("/api/preview")
def preview(body: StartRequest) -> Dict[str, Any]:
    app_id = APP_ID or "0" * 32
    cert = APP_CERTIFICATE or "1" * 32
    try:
        return preview_properties(body.settings, body.channel, app_id, cert)
    except ValueError as exc:  # configuração inválida detectada pelo SDK
        raise HTTPException(status_code=400, detail=f"Configuração inválida: {exc}")


@app.post("/api/start")
def start(body: StartRequest) -> Dict[str, Any]:
    _require_credentials()
    s = body.settings
    try:
        sess = _session(build_agent(s, _client(APP_ID, APP_CERTIFICATE)), body.channel, s)
        agent_id = sess.start()
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Configuração inválida: {exc}")
    except Exception as exc:  # noqa: BLE001 — devolve o erro da Agora para a página
        raise HTTPException(status_code=502, detail=f"Falha ao iniciar o agente: {exc}")
    return {"agentId": agent_id, "agentUid": AGENT_UID}


@app.post("/api/stop")
def stop(body: StopRequest) -> Dict[str, Any]:
    _require_credentials()
    try:
        _client(APP_ID, APP_CERTIFICATE).stop_agent(body.agentId)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Falha ao parar o agente: {exc}")
    return {"stopped": True}


class SpeakRequest(BaseModel):
    agentId: str
    text: str


@app.post("/api/speak")
def speak(body: SpeakRequest) -> Dict[str, Any]:
    """Faz o agente da Agora falar um texto agora (usado para repetir a pergunta)."""
    _require_credentials()
    try:
        # O speak não passa pelo wrapper que assina a requisição (como o stop_agent faz), então assinamos aqui.
        from agora_agent.agentkit.token import generate_convo_ai_token

        token = generate_convo_ai_token(app_id=APP_ID, app_certificate=APP_CERTIFICATE, channel_name="speak", uid=0)
        # APPEND: entra na fila e não corta o que o agente já está falando
        _client(APP_ID, APP_CERTIFICATE).agents.speak(
            APP_ID,
            body.agentId,
            text=body.text,
            priority="APPEND",
            interruptable=True,
            request_options={"additional_headers": {"Authorization": f"agora token={token}"}},
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Falha ao falar: {exc}")
    return {"spoken": True}


app.mount("/static", StaticFiles(directory=HERE / "static"), name="static")
