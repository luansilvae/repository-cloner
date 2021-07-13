const readline = require('readline-sync')
const axios = require('axios')
const Git = require("nodegit")
const chalk = require('chalk')

const colors = {
  error: chalk.bold.red,
  info: chalk.bold.blue,
  warning: chalk.bold.yellow,
  success: chalk.bold.green
}

async function start() {
  const user = {}
  user.username = askAndReturnUsername()
  user.repositories = await getApi() 

  // return github username
  function askAndReturnUsername() {
    return readline.question(
      colors.info('Enter the name of the Github user: ')
    )
  }

  // get api 
  async function getApi() {
    const { username } = user

    try{
      const response = await axios
        .get(`https://api.github.com/users/${username}/repos`)
      const content = []

      for (const { name: repository, description, clone_url } of response.data) {  
        content.push({
          repository_name: repository,
          description: description,
          clone_url: clone_url 
        })
      }

      return content

    }catch(err) {
      console.log(`${colors.error('Error:')} User ${colors.warning(username)} not found!`)
      start()
      return
    }
  }

  // return prefix 
  user.prefix = await askAndReturnPrefix()

  async function askAndReturnPrefix() {
    try{
      const repos = []
      user.repositories.forEach(item => {
        repos.push(`${item.repository_name}`)
      });
      return repos
    }catch(err){
      return null
    }
  }

  // call cloneRepository function
  user.repository_index = await cloneRepository()

  async function cloneRepository() {
    try{
      const { prefix, username } = user

      const repositoryIndex = readline.
        keyInSelect(prefix, 'Choose a repository to clone: ')

      const selectedRepositoryName = prefix[repositoryIndex]

      if(repositoryIndex >= 0){
        Git.Clone(`https://github.com/${username}/${selectedRepositoryName}`, 
          `./cloned_repositories/${selectedRepositoryName}`)
          
        console.log(colors.success(`Cloning ${colors.warning(selectedRepositoryName)} to cloned_repositories folder`))
      }
        else{ 
        console.log(colors.warning('Canceling...'))
      }
      
      return selectedRepositoryName
    }catch(err) {
        return
    }
  }
}

start()