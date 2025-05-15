export const typeDefs = `#graphql
  scalar DateTime

  type Query {
    hello: String
    users: [User!]
    workspace(id: ID!): Workspace # Updated from project
    # myWorkspaces: [Workspace!] # Example for fetching user's workspaces
  }

  type User {
    id: ID!
    name: String
    email: String
    image: String
    createdAt: DateTime
    workspaces: [Workspace!] # Updated from projects
  }

  // Renamed from Project to Workspace
  type Workspace {
    id: ID!
    name: String!
    description: String
    createdAt: DateTime
    user: User # The user who created this workspace
    # items: [WorkspaceItem!] will be added later
  }

  # type Mutation {
  #   createWorkspace(name: String!, description: String): Workspace
  # }
`;