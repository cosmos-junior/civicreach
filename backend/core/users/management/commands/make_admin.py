from django.core.management.base import BaseCommand
from users.models import User


class Command(BaseCommand):
    help = 'Set a user as admin or create a new admin user'

    def add_arguments(self, parser):
        parser.add_argument('phone', nargs='?', help='Phone number of the user to promote to admin')
        parser.add_argument('--id-number', help='ID number for new admin user')
        parser.add_argument('--password', help='Password for new admin user')

    def handle(self, *args, **options):
        phone = options.get('phone')

        if phone:
            # Make existing user admin
            try:
                user = User.objects.get(phone=phone)
                user.is_staff = True
                user.is_superuser = True
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Successfully set {phone} as admin')
                )
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'✗ User with phone {phone} not found')
                )
        else:
            # Create new admin user
            id_number = options.get('id_number')
            password = options.get('password')

            if not id_number or not password:
                self.stdout.write(
                    self.style.ERROR(
                        'To create a new admin user, provide:\n'
                        '  python manage.py make_admin 0700000000 --id-number 12345678 --password yourpassword'
                    )
                )
                return

            try:
                user = User.objects.create_superuser(
                    phone=phone or '0700000000',
                    id_number=id_number,
                    password=password
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Created admin user\n'
                        f'  Phone: {user.phone}\n'
                        f'  ID: {user.id_number}\n'
                        f'  is_staff: {user.is_staff}'
                    )
                )
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'✗ Error: {str(e)}'))


        # List all admin users
        admins = User.objects.filter(is_staff=True)
        self.stdout.write('\n' + self.style.SUCCESS('Current admin users:'))
        for admin in admins:
            self.stdout.write(f'  • {admin.phone} (ID: {admin.id_number})')
