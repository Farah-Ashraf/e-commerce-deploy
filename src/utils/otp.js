export const generateOTP = () => {
    return Math.floor(Math.random() * 900000 + 100000); //generate number of 6 digits bet. 100000 to 900000
}