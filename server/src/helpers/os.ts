import o from 'os'



/**
 * Returns information about your OS
 */
function get  ()  {
  let type = 'unknown'
  let name = ''

  if (o.type().indexOf('Windows') !== -1) {
    type = 'windows'
    name = 'Windows'
  } else if (o.type() === 'Darwin') {
    type = 'macos'
    name = 'macOS'
  } else if (o.type() === 'Linux') {
    type = 'linux'
    name = 'Linux'
  }

  return { type, name }
}

/**
 * Returns the number of cores on your machine
 */
function cpus () { return o.cpus()}

export default {cpus , get}
