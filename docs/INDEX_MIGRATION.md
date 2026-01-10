# Migração: Adição de Índices Sequenciais

## 📋 Resumo

Foi adicionado um campo `index` numérico sequencial (1, 2, 3...) na entidade:
- **User** (Representantes/admin/users)

## ✅ Retrocompatibilidade

Esta implementação é **100% retrocompatível**:
- O campo `index` é **opcional** na entidade User
- Registros existentes continuam funcionando normalmente
- Novos registros recebem automaticamente o próximo índice disponível
- A API não quebra para clientes antigos

## 🔧 Implementação

### 1. Schema Atualizado

Foram adicionados:
- Campo `@Prop({ required: false }) index?: number;` na schema User
- Hook `pre('save')` para auto-incremento automático em novos registros
- Atualização da interface TypeScript

**Arquivos modificados:**
- `src/auth/database/providers/schema/user.schema.ts`
- `src/admin/users/dto/get-user-response.dto.ts`

### 2. Auto-incremento

Quando um novo registro é criado:
```typescript
// Exemplo do hook pre-save
Schema.pre('save', async function (next) {
  if (this.isNew && !this.index) {
    const lastRecord = await this.constructor
      .findOne({}, { index: 1 })
      .sort({ index: -1 })
      .lean();
    this.index = lastRecord?.index ? lastRecord.index + 1 : 1;
  }
  next();
});
```

## 🚀 Migração de Registros Existentes

Para adicionar índices aos registros de usuários que já existem no banco, execute:

```bash
# Com npm
npm run migration:add-indexes

# Com yarn
yarn migration:add-indexes
```

### O que a migração faz:

1. Busca todos os Users sem `index`
2. Ordena por `createdAt` (mais antigos primeiro)
3. Atribui índices sequenciais começando de 1 (ou do último índice existente + 1)
4. Atualiza cada registro no banco de dados
5. Exibe relatório com quantidade de registros atualizados

### Exemplo de saída:

```
🚀 Iniciando migração de índices para Users...

📝 Processando Users...
   Encontrados 150 users sem index
   ✅ 150 users atualizados (índices 1-150)

✨ Migração concluída com sucesso!
```

## 📊 Estrutura do Campo

```typescript
{
  index?: number;  // Opcional, sequencial (1, 2, 3...)
}
```

## 🔍 Exemplo de Uso

### Antes da migração:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Depois da migração:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "João Silva",
  "email": "joao@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "index": 1
}
```

### Novo registro criado:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Maria Santos",
  "email": "maria@example.com",
  "createdAt": "2024-12-11T00:00:00.000Z",
  "index": 151  // Auto-incrementado
}
```

## ⚠️ Notas Importantes

1. **Executar apenas uma vez**: O script de migração pode ser executado múltiplas vezes com segurança (ele pula registros que já têm index)

2. **Ambiente de produção**: Recomenda-se testar em staging antes de executar em produção

3. **Backup**: Sempre faça backup do banco antes de executar migrações

4. **Performance**: Para bases com milhões de registros, considere executar fora do horário de pico

## 🎯 Benefícios

- ✅ Identificação numérica simples e legível para humanos
- ✅ Sequencial e previsível (não como _id)
- ✅ Útil para referências e ordenação
- ✅ Retrocompatível com sistemas existentes
- ✅ Sem impacto em APIs ou integrações existentes
