module.exports = function error (message, lines, lineNo) {
  const no = parseInt(lineNo, 10)

  const pad = no => {
    const width = String(no + 4).length
    const padding = Array(width).fill(' ').join('')
    return (padding + no).slice(-width)
  }

  process.stdout.write([
    `\nMessage: \n  ${message} on line #${no}.\n`,
    `Source:`,
    `  ${pad(no - 1)} │ ${lines[no - 1]}`,
    `✕ ${pad(no)} │ ${lines[no]}`,
    `  ${pad(no + 1)} │ ${lines[no + 1] || ''}\n\n`
  ].join('\n'))
}
