import { Prisma } from '@prisma/client'
import { extendType, intArg, nonNull, objectType, stringArg } from 'nexus'
import { NexusGenObjects } from '../nexus-typegen'

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('description')
    t.nonNull.string('url')
    t.field('postedBy', {
      type: 'User',
      resolve(root, _args, ctx) {
        return ctx.prisma.link
          .findUnique({ where: { id: root.id } })
          .postedBy()
      },
    })
  },
})

export const LinkQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('feed', {
      type: 'Link',
      resolve(_root, _args, ctx, _info) {
        const links = ctx.prisma.link.findMany()
        return links
      },
    })
  },
})

export const LinkMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('post', {
      type: 'Link',
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(_root, args, ctx) {
        const { description, url } = args
        const { userId } = ctx

        if (!userId) {
          throw new Error('Cannot post without logging in.')
        }

        const newLink = ctx.prisma.link.create({
          data: {
            description,
            url,
            postedBy: { connect: { id: userId } },
          },
        })

        return newLink
      },
    })
    t.nonNull.field('updateLink', {
      type: 'Link',
      args: {
        id: nonNull(intArg()),
        url: nonNull(stringArg()),
        description: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const { id, description, url } = args

        let updatedLink: NexusGenObjects['Link']
        try {
          updatedLink = await ctx.prisma.link.update({
            where: {
              id,
            },
            data: {
              description,
              url,
            },
          })
        } catch (e) {
          console.log(e)

          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === 'P2001'
          )
            throw new Error(`Could not find the post with id: ${id}`)
          else throw e
        }

        return updatedLink
      },
    }),
      t.nonNull.field('deleteLink', {
        type: 'Link',
        args: {
          id: nonNull(intArg()),
        },
        async resolve(_root, args, ctx) {
          const { id } = args
          let deletedLink: NexusGenObjects['Link']
          try {
            deletedLink = await ctx.prisma.link.delete({
              where: {
                id,
              },
            })
          } catch (e) {
            console.log(e)

            if (
              e instanceof Prisma.PrismaClientKnownRequestError &&
              e.code === 'P2001'
            )
              throw new Error(`Could not find the post with id: ${id}`)
            else throw e
          }
          return deletedLink
        },
      })
  },
})
