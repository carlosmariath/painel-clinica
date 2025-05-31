const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script para migrar planos de terapia da relação 1:1 para 1:N com filiais
 * 
 * Este script:
 * 1. Busca todos os planos de terapia existentes
 * 2. Verifica se já existe a tabela de relacionamento TherapyPlanBranch
 * 3. Associa cada plano a todas as filiais ativas ou, se especificado, à filial padrão
 */
async function migrateData() {
  try {
    console.log('Iniciando migração de planos de terapia para associação com múltiplas filiais...');
    
    // Busca os planos no banco
    const plans = await prisma.therapyPlan.findMany();
    console.log(`Encontrados ${plans.length} planos para migrar.`);
    
    // Busca as filiais existentes
    const branches = await prisma.branch.findMany({
      where: { isActive: true }
    });
    console.log(`Encontradas ${branches.length} filiais ativas disponíveis.`);
    
    if (branches.length === 0) {
      console.log('Nenhuma filial encontrada para associar aos planos!');
      return;
    }
    
    // Verificar se existe a tabela de relacionamento
    try {
      await prisma.$queryRaw`SELECT 1 FROM "TherapyPlanBranch" LIMIT 1`;
      console.log('Tabela de relacionamento TherapyPlanBranch já existe.');
    } catch (err) {
      console.error('Tabela TherapyPlanBranch não existe ainda:', err.message);
      console.log('Por favor, certifique-se de ter executado a migração do banco antes de executar este script.');
      return;
    }
    
    // Opção 1: associar cada plano a todas as filiais (comportamento padrão)
    const associateToAllBranches = process.argv.includes('--all-branches');
    
    // Opção 2: associar à filial específica pelo ID
    const branchIdArg = process.argv.find(arg => arg.startsWith('--branch-id='));
    const specificBranchId = branchIdArg ? branchIdArg.split('=')[1] : null;
    
    if (specificBranchId) {
      const branch = branches.find(b => b.id === specificBranchId);
      if (!branch) {
        console.error(`Filial com ID ${specificBranchId} não encontrada.`);
        return;
      }
      console.log(`Usando filial específica: ${branch.name} (ID: ${branch.id})`);
    } else if (!associateToAllBranches) {
      // Se não foi especificado --all-branches e nem --branch-id, usar a primeira filial
      console.log(`Usando filial padrão: ${branches[0].name} (ID: ${branches[0].id})`);
    } else {
      console.log('Associando planos a todas as filiais ativas.');
    }
    
    // Criar associações para todos os planos
    let totalAssociations = 0;
    let skippedAssociations = 0;
    
    for (const plan of plans) {
      console.log(`\nProcessando plano ${plan.id} (${plan.name})...`);
      
      // Verificar se o plano já tem associações
      const existingAssociations = await prisma.therapyPlanBranch.findMany({
        where: { therapyPlanId: plan.id }
      });
      
      if (existingAssociations.length > 0) {
        console.log(`  O plano já possui ${existingAssociations.length} filiais associadas.`);
        
        // Se já tem associações e não foi forçado, pular
        if (!process.argv.includes('--force')) {
          console.log('  Pulando... (use --force para recriar associações)');
          skippedAssociations++;
          continue;
        } else {
          console.log('  Flag --force detectada, recriando associações...');
          // Remover associações existentes se --force
          await prisma.therapyPlanBranch.deleteMany({
            where: { therapyPlanId: plan.id }
          });
        }
      }
      
      // Determinar quais filiais associar
      let branchesToAssociate = [];
      
      if (specificBranchId) {
        // Associar apenas à filial específica
        branchesToAssociate = branches.filter(b => b.id === specificBranchId);
      } else if (associateToAllBranches) {
        // Associar a todas as filiais
        branchesToAssociate = branches;
      } else {
        // Associar apenas à primeira filial (comportamento padrão)
        branchesToAssociate = [branches[0]];
      }
      
      // Criar as associações
      for (const branch of branchesToAssociate) {
        console.log(`  Associando à filial ${branch.name} (ID: ${branch.id})...`);
        
        await prisma.therapyPlanBranch.create({
          data: {
            therapyPlanId: plan.id,
            branchId: branch.id
          }
        });
        
        totalAssociations++;
      }
    }
    
    console.log('\nMigração concluída!');
    console.log(`Total de planos: ${plans.length}`);
    console.log(`Total de associações criadas: ${totalAssociations}`);
    console.log(`Planos pulados (já com associações): ${skippedAssociations}`);
    
  } catch (error) {
    console.error('Erro durante a migração de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

console.log('-------------------------------------');
console.log('MIGRAÇÃO DE PLANOS DE TERAPIA');
console.log('-------------------------------------');
console.log('Opções disponíveis:');
console.log('  --all-branches   : Associa cada plano a todas as filiais ativas');
console.log('  --branch-id=<id> : Associa os planos à filial com o ID especificado');
console.log('  --force          : Recria associações mesmo para planos que já possuem');
console.log('-------------------------------------');

migrateData(); 