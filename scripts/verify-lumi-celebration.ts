import assert from 'node:assert/strict';
import { TurnStatus } from 'agora-agent-client-toolkit';
import { LumiAnswerCelebrationDetector, LumiMaterialCompletionDetector } from '../lib/lumi-answer-celebration';
import { messages } from '../packages/i18n';

export function verifyLumiCelebration() {
  const agent = '123456';
  const user = '4321';
  const detector = new LumiAnswerCelebrationDetector();
  const turn = (uid: string, id: number, text: string, status = TurnStatus.END) => ({ uid, turn_id: id, text, status });
  const answer = turn(user, 1, 'São quatro.');
  const correct = turn(agent, 1, `${messages.voice.correctAnswerConfirmation} Pode escrever na folha.`);
  const observe = (turns: Parameters<typeof detector.observe>[0], enabled = true) => detector.observe(turns, agent, user, enabled);
  assert.equal(observe([turn(agent, 0, 'Oi! Vamos ler a lição?')]), null, 'Uploading/greeting is not success');
  assert.equal(observe([answer, { ...correct, status: TurnStatus.IN_PROGRESS }]), null, 'Wait for a completed verdict');
  assert.equal(observe([answer, correct]), `${agent}:1`);
  assert.equal(observe([answer, correct]), null, 'Repeated transcript snapshots must not replay the celebration');
  assert.equal(observe([turn(user, 2, messages.voice.correctAnswerConfirmation), turn(agent, 2, 'Vamos conferir juntos.')]), null, 'A user cannot trigger success by saying the confirmation');
  for (const [index, text] of [
    'Muito bem por tentar! Vamos conferir de novo.',
    'Você acertou uma parte, mas falta terminar.',
    'Quando acertar, vou dizer: Você acertou!',
    'Você não acertou ainda. Vamos tentar juntos.',
    'Você acertou?',
  ].entries()) {
    assert.equal(observe([answer, turn(agent, 10 + index, text)]), null, 'Generic praise, examples, questions and partial answers are not verdicts');
  }
  assert.equal(observe([answer, turn(agent, 20, correct.text, TurnStatus.INTERRUPTED)]), null);
  assert.equal(observe([answer, turn(agent, 20, correct.text)]), null, 'An interrupted confirmation must not return later');
  assert.equal(observe([answer, turn(agent, 21, correct.text)], false), null);
  assert.equal(observe([answer, turn(agent, 21, correct.text)]), null, 'Disabled contexts discard old events');
  assert.equal(observe([answer, turn('9999', 22, correct.text)]), null, 'Only the agent can confirm');
  assert.equal(observe([turn(user, 23, 'Cinco.'), turn(agent, 23, '  VOCE ACERTOU! Continue assim.')]), `${agent}:23`, 'Another question can trigger a new cycle');
  assert.equal(new LumiAnswerCelebrationDetector().observe([correct], agent, user, true), null, 'A greeting without a user answer must never celebrate');
  assert.ok(messages.voice.homeworkPrompt('Lia', 8, 'fluent', 'Lição de teste').includes(`exatamente com "${messages.voice.correctAnswerConfirmation}"`), 'Tutor and detector must share the same confirmation');
  const completion = new LumiMaterialCompletionDetector();
  const completed = messages.voice.materialCompletionConfirmation;
  const finish = (turns: Parameters<typeof completion.observe>[0], enabled = true) => completion.observe(turns, agent, user, enabled);
  assert.equal(finish([answer, correct]), null, 'One correct question must not complete the entire material');
  assert.equal(finish([turn(agent, 2, completed)]), null, 'A greeting cannot complete a material');
  assert.equal(finish([turn(user, 3, completed), turn(agent, 3, 'Vamos conferir.')]), null, 'Only the tutor can confirm completion');
  for (const [index, text] of [
    'Ainda não concluímos a atividade.',
    'Atividade concluída com sucesso?',
    'Quando terminar, vou dizer: Atividade concluída com sucesso!',
    'Você acertou! Agora falta a segunda questão.',
  ].entries()) assert.equal(finish([answer, turn(agent, 30 + index, text)]), null);
  assert.equal(finish([answer, turn(agent, 40, completed, TurnStatus.IN_PROGRESS)]), null);
  assert.equal(finish([answer, turn(agent, 40, `${completed} Aprendemos a somar!`)]), `${agent}:40`);
  assert.equal(finish([answer, turn(agent, 40, completed)]), null, 'Repeated completion snapshots must not save twice');
  assert.equal(finish([answer, turn(agent, 41, completed, TurnStatus.INTERRUPTED)]), null);
  assert.equal(finish([answer, turn(agent, 41, completed)]), null, 'Interrupted final phrases do not complete');
  assert.equal(finish([answer, turn(agent, 42, completed)], false), null);
  assert.equal(finish([answer, turn(agent, 42, completed)]), null, 'Disabled/old sessions cannot replay completion');
  const prompt = messages.voice.homeworkPrompt('Lia', 8, 'fluent', 'Duas questões.');
  assert.ok(prompt.includes(`exatamente com "${completed}"`));
  assert.ok(prompt.includes('TODAS as questões e etapas'), 'The final cue requires the whole worksheet to be checked');
  console.log('Lumi correct-answer confirmation and deduplication checks passed');
}
