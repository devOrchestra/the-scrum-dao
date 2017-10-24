export interface IRegisterUserFromForm {
    username: string
    email: string
    password: string
    passwordConfirmation: string
}

export interface IRegisterUser {
    username: string
    email: {
        address: string
    }
    password: string
}
