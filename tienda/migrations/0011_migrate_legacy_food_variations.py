# Generated manually to migrate food variations to standardized names

from django.db import migrations

def migrate_legacy_variations(apps, schema_editor):
    ProductoVariacion = apps.get_model('tienda', 'ProductoVariacion')
    
    # Categories: AGRICOLA, HORTALIZAS, FRUTAS, CARNES
    for v in ProductoVariacion.objects.filter(producto__categoria__in=['AGRICOLA', 'HORTALIZAS', 'FRUTAS', 'CARNES']):
        if v.nombre in ['1 Unidad', 'Por Unidad', 'Unidad']:
            v.nombre = '1 Libra'
            v.save()
        elif v.nombre in ['Por Kilo', 'Kilo']:
            v.nombre = '1 Kilo'
            v.save()

    # Categories: LACTEOS
    for v in ProductoVariacion.objects.filter(producto__categoria='LACTEOS'):
        if v.nombre in ['1 Kilo', 'Por Kilo', 'Kilo']:
            v.nombre = '1 Libra'
            v.save()
        elif v.nombre in ['1 Unidad', 'Por Unidad', 'Unidad', '500 Gramos']:
            v.nombre = '500 Gramos'
            v.save()

    # Categories: BEBIDAS
    for v in ProductoVariacion.objects.filter(producto__categoria='BEBIDAS'):
        if v.nombre in ['1 Kilo', 'Por Kilo', 'Kilo', '1 Litro', 'Litro']:
            v.nombre = '1 Litro'
            v.save()
        elif v.nombre in ['1 Unidad', 'Por Unidad', 'Unidad', '500 Mililitros', '500 ml']:
            v.nombre = '500 Mililitros'
            v.save()

class Migration(migrations.Migration):

    dependencies = [
        ('tienda', '0010_alter_producto_categoria'),
    ]

    operations = [
        migrations.RunPython(migrate_legacy_variations),
    ]
