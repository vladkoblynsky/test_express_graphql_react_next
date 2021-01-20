import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
	// let testAccount = await nodemailer.createTestAccount()
	let transporter = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: "y7vj23kq6rvjpvjc@ethereal.email",
			pass: "CqtKDH8dFf1Vbyfj8A",
		},
	});

	let info = await transporter.sendMail({
		from: '"Fred Foo 👻" <foo@example.com>', // sender address
		to,
		subject: "Change password",
		html,
	});

	console.log("Message sent: %s", info.messageId);
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
