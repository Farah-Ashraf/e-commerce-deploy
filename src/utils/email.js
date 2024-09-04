import nodemailer from 'nodemailer';
export const sendEmail = async ({ to='', subject='', html='' }) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "farahashraf268f@gmail.com",
          pass: "xoct jqfj eoqq sfnf",
        },
      });

      const info = await transporter.sendMail({
        from: 'ecommerce', // sender address
        to, // list of receivers
        subject, // Subject line
        html, // html body
      });
    
      

}


