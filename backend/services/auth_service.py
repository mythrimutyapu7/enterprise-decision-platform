from database.mongodb import database
from utils.security import hash_password, verify_password
from utils.jwt_handler import create_access_token
from datetime import datetime
from fastapi import HTTPException, status

# MongoDB Collection
users_collection = database["users"]


# -----------------------------
# Register User
# -----------------------------
async def register_user(user):
    try:
        # Check if email already exists
        existing_user = await users_collection.find_one(
            {"email": user.email}
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already exists"
        )

        # Create user document
        hashed_password = hash_password(user.password)
        user_data = {
            "name": user.name,
            "email": user.email,
            "password": hashed_password,
            "role": user.role,
            "created_at": datetime.utcnow()
        }

        # Insert into MongoDB
        result = await users_collection.insert_one(user_data)

        return {
            "success": True,
            "message": "User Registered Successfully",
            "id": str(result.inserted_id)
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# -----------------------------
# Login User
# -----------------------------
async def login_user(user):
    try:
        # Find user by email
        existing_user = await users_collection.find_one(
            {"email": user.email}
        )

        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
        )

        # Check password
        if not verify_password(
            user.password,
            existing_user["password"]
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password"
            )

        # Login successful
        token = create_access_token(
        {
            "sub": existing_user["email"],
            "role": existing_user["role"]
            }
        )

        return {
            "success": True,
            "message": "Login Successful",
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": str(existing_user["_id"]),
                "name": existing_user["name"],
                "email": existing_user["email"],
                "role": existing_user["role"]
            }
        }

    except HTTPException:
        raise 
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )