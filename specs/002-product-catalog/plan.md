# Implementation Plan: Product Catalog

**Branch**: `002-product-catalog` | **Date**: 2026-05-11 | **Spec**: [spec.md](./spec.md)
**Input**: User feedback: "Simple products only. External image URLs."

## Summary

Implement the Product Catalog feature, enabling users to browse and view product details. The implementation will focus on simple product structures and external image links as per user requirements.

## Technical Context

**Language/Version**: Python 3.x / Django 6.0.4  
**Primary Dependencies**: Django, Django Rest Framework (DRF)  
**Storage**: PostgreSQL / SQLite  
**Testing**: Django Testing Framework / DRF APITestCase

## Constitution Check

- **Arquitectura**: Django Rest Framework (Headless). (Pass)
- **Base de Datos**: Relacional. (Pass)
- **Simple Products**: Only one model, no variants. (Pass)
- **External Images**: URLField in model. (Pass)

## Project Structure

### Documentation

```text
specs/002-product-catalog/
├── spec.md
├── plan.md
└── tasks.md
```

### Source Code

```text
tienda/
├── models.py            # Add Producto model
├── serializers.py       # Add ProductoSerializer
├── views.py             # Add ProductoViewSet
├── urls.py              # Register product routes
└── admin.py             # Register Producto in admin
```

## Implementation Strategy

1.  **Model**: Define `Producto` with fields: `nombre`, `descripcion`, `precio`, `stock`, `imagen_url`.
2.  **Migrations**: Generate and apply migrations.
3.  **Serializer**: Create `ProductoSerializer` (all fields).
4.  **Views**: Use `ReadOnlyModelViewSet` for the public API.
5.  **Admin**: Register the model for administrative control.
6.  **Tests**: Verify the API behavior.
