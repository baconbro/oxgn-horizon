export const typeDefs = `#graphql
  scalar DateTime

  type Query {
    hello: String
    users: [User!]
    workspace(id: ID!): Workspace
    # myWorkspaces: [Workspace!]
  }

  type User {
    id: ID!
    name: String
    email: String
    image: String
    createdAt: DateTime
    workspaces: [Workspace!]
  }

  type Workspace {
    id: ID!
    name: String!
    description: String
    createdAt: DateTime
    user: User
    # items: [WorkspaceItem!] will be added later
  }

  # type Mutation {
  #   createWorkspace(name: String!, description: String): Workspace
  # }
`;