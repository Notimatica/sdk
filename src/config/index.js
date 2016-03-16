import development from './development.config'
import production from './production.config'

var env = process.env.NODE_ENV || 'production'

var map = {
  development,
  production
}

var config = map[env]

export default config
