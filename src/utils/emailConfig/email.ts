import axios from 'axios'



interface EmailParams {
    firstName: string;
    email: string;
    subject: string;
    htmlContent: string;
}



// const sendMail = as