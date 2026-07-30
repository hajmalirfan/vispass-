from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    role: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True
