import 'dotenv/config';
import express from "express";

const app = express();



app.get('/github', (request, response) => {
  response.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`)
})

app.get('/register/callback', (request, response) => {

  const { code } = response.q

})

app.listen(8080, () => console.log('🤯 o Servidor Funcionou, porta 8080  🚀 😎'))