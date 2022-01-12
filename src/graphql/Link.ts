import { extendType, objectType, nonNull, stringArg, intArg } from 'nexus'
import { NexusGenObjects } from '../nexus-typegen'

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('description')
    t.nonNull.string('url')
  },
})

const links: NexusGenObjects['Link'][] = [
  {
    id: 1,
    url: 'www.howtographql.com',
    description: 'Fullstack tutorial for GraphQL',
  },
  {
    id: 2,
    url: 'graphqo.org',
    description: 'GraphQL official website',
  },
]

export const LinkQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('feed', {
      type: 'Link',
      resolve(_root, _args, _ctx, _info) {
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

      resolve(_root, args, _ctx) {
        const { description, url } = args

        const idCount = links[links.length -1].id + 1
        const link = {
          id: idCount,
          description: description,
          url: url,
        }
        links.push(link)
        return link
      },
    });
    t.nonNull.field('updateLink', {
      type:'Link',
      args: {
        id: nonNull(intArg()),
        url: stringArg(),
        description: stringArg(),
      },
      resolve(_root, args, _ctx) {
        const { id, description, url } = args
        
        const linkIndex = links.findIndex(l => l.id === id)
        // console.log(linkIndex)
        // console.log(args)
        // console.log(links)
        if (linkIndex === -1){
          throw new Error(`Could not find the post with id ${id}`)
        }

        if(description)
          links[linkIndex].description = description
        if(url)
          links[linkIndex].id = id
         
        return links[linkIndex]

      }
    }),
    t.nonNull.field('deleteLink', {
      type: 'Link',
      args: {
        id: nonNull(intArg()),
      },
      resolve(_root, args, _ctx) {
        const { id } = args

        const linkIndex = links.findIndex(l => l.id === id)

        if (linkIndex === -1){
          throw new Error(`Could not find the post with id ${id}`)
        }

        // copy the object before deleting
        const deletedItem = {
          ...links[linkIndex]
        }
        links.splice(linkIndex, 1)
        return deletedItem
      }
    })
  },
})
