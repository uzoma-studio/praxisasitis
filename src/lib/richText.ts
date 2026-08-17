// Walks a Payload Lexical richText JSON tree and collects plain text from
// every text node, dropping formatting (bold, links, etc.) entirely.
export function richTextToPlainText(richText: any): string {
  if (!richText?.root?.children) return ''

  const walk = (nodes: any[]): string =>
    nodes
      .map((node) => {
        if (node.type === 'text') return node.text ?? ''
        if (node.children) return walk(node.children)
        return ''
      })
      .join(' ')

  return walk(richText.root.children).replace(/\s+/g, ' ').trim()
}

// Cuts plain text down to a word count, for use as a card excerpt.
export function truncateWords(text: string, maxWords: number): string {
  const words = text.split(' ')
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '…'
}