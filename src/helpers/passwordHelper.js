import bcrypt from "bcryptjs";

export const PasswordHashing = async (password) => {
    const result = await bcrypt.hash(password, 10);
    return result;
};

export const PasswordCompare = async (password, passwordHashing) => {
    if (!password || !passwordHashing) {
        return false;
    }

    try {
        const matched = await bcrypt.compare(password, passwordHashing);
        return matched;
    } catch (error) {
        return false;
    }
};
