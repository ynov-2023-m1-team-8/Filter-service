const sendmail = require('sendmail')();

const email = {
    from: 'votreadresse@example.com',
    to: 'destinataire@example.com',
    subject: 'Sujet de l\'e-mail',
    html: 'Contenu HTML de l\'e-mail'
};

sendmail(email, (err, reply) => {
    if (err) {
        console.error(err);
    } else {
        console.log(reply);
    }
});
