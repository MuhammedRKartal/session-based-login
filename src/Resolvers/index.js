import crypto from "crypto";
import moment from "moment";
import nodemailer from "nodemailer";
import User from "../Models/User.js";
import { ApolloError } from "apollo-server-express";

const resolvers = {
	Query: {
		getUser: async (root, args) => {
			if (args.email) {
				return await User.find({ email: args.email });
			}
			if (args.phone) {
				return await User.find({ phone: args.phone });
			}
			if (args.id) {
				return await User.findById(args.id);
			}
			return await User.find({});
		},
		getSingleUser: async (root, args) => {
			if (args.email) {
				return await User.findOne({ email: args.email });
			}
			if (args.phone) {
				return await User.findOne({ phone: args.phone });
			}
			if (args.id) {
				return await User.findById(args.id);
			}
			throw new ApolloError("User doesn't exists");
		},
	},
	Mutation: {
		addUser: async (root, args) => {
			const user = await User.findOne({ name: args.email });
			if (!user) {
				const newUser = new User({
					name: args.name,
					surname: args.surname,
					email: args.email,
					phone: args.phone,
					sessionToken: crypto.randomBytes(28).toString("hex"),
					sessionExpiryDate: moment().add(1, "hours").valueOf(),
					loginToken: "0",
					loginTokenExpiryDate: "0",
				});
				return await newUser.save();
			} else {
				throw new ApolloError("User already exists");
			}
		},

		login: async (root, args) => {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			const user = await User.findOne({ email: args.email });

			let transporter = nodemailer.createTransport({
				host: "smtp.sendgrid.net",
				port: 465,
				secure: true,
				auth: {
					user: "apikey",
					pass: "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",
				},
			});
			if (!user) {
				throw new ApolloError("User doesn't exists");
			} else {
				const filter = { _id: user._id };
				const update = {
					loginToken: Math.floor(1000 + Math.random() * 9000),
					loginTokenExpiryDate: moment().add(2, "minutes").valueOf(),
					sessionToken: crypto.randomBytes(28).toString("hex"),
					sessionExpiryDate: moment().add(2, "hours").valueOf(),
				};
				await transporter
					.sendMail({
						from: '"Alper Kartal 👻" <para.noreply@gmail.com>', // sender address
						to: args.email, // list of receivers
						subject: "Hello ✔", // Subject line
						html: `<b>${update.loginToken}</b>`, // html body
					})
					.then((message) => {
						console.log("message sent");
					})
					.catch((error) => {
						console.log(error);
					});
				return await User.findOneAndUpdate(filter, update, { new: true });
			}
		},
		verifyLogin: async (root, args) => {
			const user = await User.findOne({
				email: args.email,
				loginToken: args.loginToken,
			});
			if (!user) {
				throw new ApolloError("Token is wrong");
			} else {
				if (user.loginTokenExpiryDate - moment().valueOf() <= 0) {
					throw new ApolloError("Time Expired");
				} else {
					// const filter = { _id: user._id };
					// const update = {
					// 	sessionToken: crypto.randomBytes(28).toString("hex"),
					// 	sessionExpiryDate: moment().add(2, "hours").valueOf(),
					// };
					// await User.findOneAndUpdate(filter, update, { new: true });
					return await user;
				}
			}
		},

		createToken: async (root, args) => {
			const user = await User.findOne({ email: args.email });
			if (!user) {
				throw new ApolloError("User doesn't exists");
			} else {
				if (user.loginTokenExpiryDate - moment().valueOf() <= 0) {
					const filter = { _id: user._id };
					const update = {
						loginToken: Math.floor(1000 + Math.random() * 9000),
						loginTokenExpiryDate: moment().add(2, "minutes").valueOf(),
					};

					return await User.findOneAndUpdate(filter, update, { new: true });
				} else {
					return user;
				}
			}
		},
		deleteToken: async (root, args) => {
			const filter = { email: args.email };
			const update = {
				sessionToken: null,
				loginTokenExpiryDate: "0",
			};
			return await User.findOneAndUpdate(filter, update, { new: true });
		},
		controlSession: async (root, args) => {
			console.log(args.sessionToken);
			const user = await User.findOne({ sessionToken: args.sessionToken });
			console.log(user);
			if (!user) {
				throw new ApolloError("Session doesn't exists");
			} else {
				if (!user.sessionExpiryDate) {
					throw new ApolloError("No expiry Date");
				}
				if (user.sessionExpiryDate - moment().valueOf() <= 0) {
					const filter = { _id: user._id };
					const update = {
						sessionToken: crypto.randomBytes(28).toString("hex"),
						sessionExpiryDate: moment().add(1, "hours").valueOf(),
					};
					await User.findOneAndUpdate(filter, update, { new: true });

					throw new ApolloError("Session updated");
				} else {
					console.log(user);
					return user;
				}
			}
		},
	},
};

export default resolvers;
