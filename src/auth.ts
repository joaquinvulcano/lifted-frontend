import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',      type: 'email'    },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email    = String(credentials?.email    ?? '')
        const password = String(credentials?.password ?? '')

        if (
          email    === process.env.AUTH_USER &&
          password === process.env.AUTH_PASSWORD
        ) {
          return { id: '1', email }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
})
