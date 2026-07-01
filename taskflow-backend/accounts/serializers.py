from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User 
        fields = ["id", "username", "email", "avatar_url", "date_joined"]
        read_only_fields = fields

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True, validators = [validate_password])
    password2 = serializers.CharField(write_only = True)

    class Meta:
        model = User 
        fields = ['username','email',"password","password2"]

    def validate(self,attrs):
            if attrs['password'] != attrs['password2']:
                raise serializers.ValidationError({"password2":"Passwords doesn't match"})
            return attrs
        
    def create(self,validated_date):
            validated_date.pop("password2")
            user = User.objects.create_user(**validated_date)
            return user
        
        