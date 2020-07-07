const choices = ['A', 'B', 'C', 'D', 'E', 'F']

const choicesTitle = ['选项 A', '选项 B', '选项 C', '选项 D', '选项 E', '选项 F']

export function getChoice(index) {
  return choices[index]
}

export function getChoiceTitle(index) {
  return choicesTitle[index]
}

export function isChoice(typeId) {
  return typeId !== '' && (typeId === 1 || typeId === 2)
}

export function isMulChoice(typeId) {
  return typeId !== '' && typeId === 2
}

export default { getChoice, getChoiceTitle, isChoice, isMulChoice }
