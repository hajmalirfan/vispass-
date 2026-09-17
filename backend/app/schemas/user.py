from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    role: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str


class AdminLoginOTPRequest(BaseModel):
    email: EmailStr


class AdminVerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str
