import axios from "axios"
import prismaClient from "../prisma"
import { sign } from "jsonwebtoken"

interface AccessToken {
  access_token: string
}
interface UserData {
  avatar_url: string,
  login: string,
  name: string,
  id: number
}

class AuthUserService {
  async execute(code: string) {

    const gitUrl = "https://github.com/login/oauth/access_token"
    const { data: gitToken } = await axios.post<AccessToken>(gitUrl, null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      headers: {
        "Accept": "application/json"
      }
    });

    const response = await axios.get<UserData>("https://api.github.com/user", {
      headers: {
        authorization: `Bearer ${gitToken.access_token}`
      },
    });

    const { avatar_url, login, name, id } = await response.data

    let user = await prismaClient.user.findFirst({
      where: {
        github_id: id
      }
    })

    if (!user) {
      prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name
        }
      })
    }


    const token = sign({
      user: {
        name: user.name,
        avatar_url: user.avatar_url,
        id: user.id

      }
    },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: '1d'

      }
    )

    return response.data
  }

}

export { AuthUserService }