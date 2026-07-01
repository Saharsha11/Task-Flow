from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank= True)

    USERNAME_FIELD = 'username' # what you log in with
    REQUIRED_FIELDS = ['email'] # what is required on createsuperuser

    def __str__(self):
        return self.username