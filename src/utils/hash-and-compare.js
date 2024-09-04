import bcrypt from 'bcrypt';
export const hashPassword = ({password='', saltRound=8}) => {
    return bcrypt.hashSync(password, saltRound);
}

export const comparePassword = ({password='', hashedPassword=''}) => {
    return bcrypt.compareSync(password, hashedPassword);
}