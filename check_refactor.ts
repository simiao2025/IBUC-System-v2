import { UserServiceV2 } from './src/services/userService.v2';

const mockUser = {
  id: 'test-id',
  nome_completo: 'Test User',
  email: 'test@ibuc.org.br',
  role: 'professor',
  polo_id: 'polo-123',
  ativo: true,
  metadata: {
    qualifications: ['Teologia'],
    hireDate: '2023-01-01'
  }
};

try {
  const mapped = UserServiceV2.mapToAdminUser(mockUser as any);
  console.log('Mapped User:', JSON.stringify(mapped, null, 2));
  
  if (mapped.qualifications?.[0] === 'Teologia' && mapped.hireDate === '2023-01-01') {
    console.log('✅ Mapping successful!');
  } else {
    console.error('❌ Mapping failed!');
    process.exit(1);
  }
} catch (e) {
  console.error('❌ Error during mapping:', e);
  process.exit(1);
}
