import { z } from 'zod';

// ============
// 1) Usuarios / Admin
// ============
export const UserRoleSchema = z.enum(['admin', 'editor']);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  role: UserRoleSchema.default('admin'),
  is_active: z.number().int().min(0).max(1).default(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Schema interno que incluye password (para uso interno en BD)
export const UserWithPasswordSchema = UserSchema.extend({
  password: z.string().nullable().optional(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(1, 'La contraseña es requerida'),
  role: UserRoleSchema.optional().default('admin'),
  is_active: z.number().int().min(0).max(1).optional().default(1),
});

export const UpdateUserSchema = CreateUserSchema.omit({
  password: true,
}).partial().extend({
  email: z.string().email().optional(),
  password: z.string().min(1, 'La contraseña debe tener al menos 1 carácter').optional(),
});

// ============
// 2) Sucursales
// ============
export const BranchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  is_active: z.number().int().min(0).max(1).default(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateBranchSchema = BranchSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  name: z.string().min(1),
  address: z.string().optional(),
  phone: z.string().optional(),
  is_active: z.number().int().min(0).max(1).optional().default(1),
});

export const UpdateBranchSchema = CreateBranchSchema.partial().extend({
  name: z.string().min(1).optional(),
});

// ============
// 3) Productos
// ============
// CurrencySchema solo para settings, no para products
export const CurrencySchema = z.enum(['MXN', 'USD', 'EUR']);

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  price_cents: z.number().int().min(0),
  stock: z.number().int().min(0).default(0),
  is_active: z.number().int().min(0).max(1).default(1),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  name: z.string().min(1),
  description: z.string().optional(),
  price_cents: z.number().int().min(0),
  stock: z.number().int().min(0).optional().default(0),
  is_active: z.number().int().min(0).max(1).optional().default(1),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  name: z.string().min(1).optional(),
  price_cents: z.number().int().min(0).optional(),
});

// ============
// 4) Imagen de Producto
// ============
export const ProductImageSchema = z.object({
  product_id: z.string().uuid(),
  png_bytes: z.instanceof(Buffer).or(z.instanceof(Uint8Array)),
  bytes_size: z.number().int().positive(),
  updated_at: z.string().datetime(),
});

export const CreateProductImageSchema = ProductImageSchema.omit({
  updated_at: true,
}).extend({
  product_id: z.string().uuid(),
  png_bytes: z.instanceof(Buffer).or(z.instanceof(Uint8Array)),
  bytes_size: z.number().int().positive(),
});

export const UpdateProductImageSchema = CreateProductImageSchema.partial();

// Schema para validar archivos de imagen PNG
export const ProductImageFileSchema = z.object({
  product_id: z.string().uuid(),
  file: z
    .instanceof(File)
    .refine((file) => file.type === 'image/png', {
      message: 'El archivo debe ser una imagen PNG',
    })
    .refine((file) => file.size <= 512000, {
      message: 'El archivo no puede exceder 500 KB',
    }),
});

// ============
// 5) Configuración General
// ============
export const AccentColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
  message: 'El color debe estar en formato hexadecimal (#RRGGBB)',
});

export const SettingsSchema = z.object({
  id: z.literal(1),
  store_name: z.string().min(1).default('FlexiShop'),
  default_whatsapp: z.string().nullable().optional(),
  currency: CurrencySchema.default('MXN'),
  accent_color: AccentColorSchema.default('#000000'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const UpdateSettingsSchema = SettingsSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).partial().extend({
  store_name: z.string().min(1).optional(),
  default_whatsapp: z.string().optional(),
  currency: CurrencySchema.optional(),
  accent_color: AccentColorSchema.optional(),
});

// ============
// Tipos derivados (TypeScript types from schemas)
// ============
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;

export type Branch = z.infer<typeof BranchSchema>;
export type CreateBranch = z.infer<typeof CreateBranchSchema>;
export type UpdateBranch = z.infer<typeof UpdateBranchSchema>;

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;

export type ProductImage = z.infer<typeof ProductImageSchema>;
export type CreateProductImage = z.infer<typeof CreateProductImageSchema>;
export type UpdateProductImage = z.infer<typeof UpdateProductImageSchema>;
export type ProductImageFile = z.infer<typeof ProductImageFileSchema>;

export type Settings = z.infer<typeof SettingsSchema>;
export type UpdateSettings = z.infer<typeof UpdateSettingsSchema>;

