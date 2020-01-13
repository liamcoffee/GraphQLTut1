// start npm run dev, npm run json:server
const graphql = require('graphql');
const axios = require('axios');

const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull } = graphql;

const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: () => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		users: {
			type: new GraphQLList(UserType),
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`).then((res) => res.data);
			}
		}
	})
});

// this tell graphql what a user type looks like
const UserType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: { type: GraphQLString },
		firstName: { type: GraphQLString },
		age: { type: GraphQLInt },
		company: {
			type: CompanyType,
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`).then((res) => res.data);
			}
		}
	})
});

// Where is this query in spotlight? I i run a query without the args, a error comes back asking for name! this is the argument below (id)
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		user: {
			type: UserType,
			args: {
				id: {
					type: GraphQLString
				}
			},
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/users/${args.id}`).then((res) => res.data);
			}
		},
		company: {
			type: CompanyType,
			args: {
				id: {
					type: GraphQLString
				}
			},
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${args.id}`).then((res) => res.data);
			}
		}
	}
});

// mutations baby!

// fields describe the mutation!
const mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addUser: {
			type: UserType,
			args: {
				firstName: { type: new GraphQLNonNull(GraphQLString) },
				age: { type: new GraphQLNonNull(GraphQLInt) },
				companyId: { type: GraphQLString }
			},
			resolve(parentValue, { firstName, age }) {
				return axios.post('http://localhost:3000/users/', { firstName, age }).then((res) => res.data);
			}
		},
		deleteuser: {
			type: UserType,
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},
			resolve(parentValue, { id }) {
				return axios.delete(`http://localhost:3000/users/${id}`).then((res) => res.data);
			}
		},
		editUser: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
				firstName: { type: GraphQLString },
				age: { type: GraphQLInt },
				companyId: { type: GraphQLString }
			},
			resolve(parentValue, { id, firstName, age, companyId }) {
				return axios
					.patch(`http://localhost:3000/users/${id}`, { firstName, age, companyId })
					.then((res) => res.data);
			}
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation
});

// SAMPLE QUERY, THIS WOULD REQUIRE NEW ENDPOINT IN REST! can name queries to run multiple!
// {
//     query1: company(id: "1") {
//       id
//       name
//       users {
//         firstName
//       }
//     }
//     query2: company(id: "1") {
//       id
//       name
//       users {
//         firstName
//       }
//     }
//   }

// SAMPLE MUTATION, MUST RETURN VALUES!

// mutation {
//     addUser(firstName: "john", age: 23){
//       id,
//       firstName,
//       age
//     }
//   }
