from database.mongodb import database
from utils.security import hash_password, verify_password

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
            return {
                "success": False,
                "message": "User already exists"
            }

        # Create user document
        hashed_password = hash_password(user.password)
        user_data = {
            "name": user.name,
            "email": user.email,
            "password": hashed_password,
            "role": user.role
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
            return {
                "success": False,
                "message": "User not found"
            }

        # Check password
        if not verify_password(
            user.password,
            existing_user["password"]
        ):
            return {
                "success": False,
                "message": "Invalid password"
            }

        # Login successful
        return {
            "success": True,
            "message": "Login Successful",
            "user": {
                "id": str(existing_user["_id"]),
                "name": existing_user["name"],
                "email": existing_user["email"],
                "role": existing_user["role"]
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }