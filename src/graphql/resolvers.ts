import { prisma } from '@/lib/prisma';
import { GraphQLResolveInfo, GraphQLScalarType, Kind } from 'graphql';
import { Context } from './context';

export const dateTimeScalar = new GraphQLScalarType({ /* ... same as before ... */
  name: 'DateTime',
  description: 'DateTime custom scalar type representing an ISO-8601 string.',
  serialize(value: unknown): string {
    if (value instanceof Date) { return value.toISOString(); }
    throw Error('GraphQL DateTime Scalar serializer expected a `Date` object');
  },
  parseValue(value: unknown): Date {
    if (typeof value === 'string') {
      const date = new Date(value);
      if (isNaN(date.getTime())) { throw new Error('GraphQL DateTime Scalar parser expected a valid ISO-8601 string'); }
      return date;
    }
    throw new Error('GraphQL DateTime Scalar parser expected a `string`');
  },
  parseLiteral(ast): Date | null {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      if (isNaN(date.getTime())) { throw new Error('GraphQL DateTime Scalar parser expected a valid ISO-8601 string from literal');}
      return date;
    }
    return null;
  },
});

export const resolvers = {
  DateTime: dateTimeScalar,

  Query: {
    hello: () => 'Hello from Horizon GraphQL API!',
    users: async (_parent: any, _args: any, context: Context, _info: GraphQLResolveInfo) => {
      return prisma.user.findMany();
    },
    // Updated from project to workspace
    workspace: async (_parent: any, { id }: { id: string }, context: Context, _info: GraphQLResolveInfo) => {
      return prisma.workspace.findUnique({ where: { id } });
    }
  },
  User: {
    // Updated from projects to workspaces
    workspaces: async (parentUser: { id: string }, _args: any, context: Context, _info: GraphQLResolveInfo) => {
      return prisma.workspace.findMany({ where: { userId: parentUser.id } });
    }
  },
  // Renamed from Project to Workspace
  Workspace: {
     user: async (parentWorkspace: { userId: string }, _args: any, context: Context, _info: GraphQLResolveInfo) => {
      return prisma.user.findUnique({ where: { id: parentWorkspace.userId } });
    }
  }
  // Mutation: { ... }
};