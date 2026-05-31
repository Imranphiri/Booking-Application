import bcrypt from 'bcryptjs';
import { prisma } from './src/lib/prisma';

async function createSuperAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('superadmin123', 12);
    
    const superAdmin = await prisma.user.create({
      data: {
        name: 'System Owner',
        email: 'owner@transithub.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN'
      }
    });
    
    console.log('Super Admin user created:', superAdmin);
    
    // Also create regular admin for testing
    const adminHashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@transithub.com',
        password: adminHashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('Admin user created:', admin);
    
    // Create default system settings
    const settings = await prisma.systemSettings.create({
      data: {
        companyName: 'TransitHub Malawi',
        companyEmail: 'info@transithub.mw',
        companyPhone: '+265 999 123 456',
        companyAddress: 'Lilongwe, Malawi',
        aboutUs: 'Premier transport management system for Malawi',
        contactInfo: 'Contact us at info@transithub.mw',
        termsAndConditions: 'Standard terms and conditions for transport services.',
        privacyPolicy: 'We respect your privacy and protect your data.',
        socialMediaLinks: JSON.stringify({})
      }
    });
    
    console.log('System settings created:', settings);
    
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
