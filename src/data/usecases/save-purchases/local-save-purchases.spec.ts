import { CacheStore } from '@/data/protocols/cache'
import { SavePurchases } from '@/domain/usecases'
import { LocalSavePurchases } from './local-save-purchases'

class CacheStoreSpy implements CacheStore {
    deleteCallsCount = 0
    insertCallsCount = 0
    deleteKey: string
    insertKey: string
    insertValues: Array<SavePurchases.params> = []

    delete(key: string): void {
        this.deleteCallsCount++
        this.deleteKey = key
    }
    insert(key: string, value: any): void {
        this.insertCallsCount++
        this.deleteKey = key
        this.insertKey = key
        this.insertValues = value

    }

    simulateDeleteError (): void {
        jest.spyOn(CacheStoreSpy.prototype, 'delete').mockImplementationOnce(() => { throw new Error() })

    }
    simulateInsertError (): void {
        jest.spyOn(CacheStoreSpy.prototype, 'insert').mockImplementationOnce(() => { throw new Error() })

    }
}

const mockPurchase = (): Array<SavePurchases.params> => [{
    id: '1',
    date: new Date(),
    value: 50
}, {
    id: '2',
    date: new Date(),
    value: 70
}]

type SutTypes = {
    sut: LocalSavePurchases
    cacheStore: CacheStoreSpy
}

// factory method
const makeSut = (): SutTypes => {
    const cacheStore = new CacheStoreSpy()
    const sut = new LocalSavePurchases(cacheStore)
    return {
        sut,
        cacheStore
    }
}
//Garante que nao tenha error por modificacoes no construtor
describe('LocalSavePurchases', () => {
    test('Should not delete cache on sut.init', () => {
        const { cacheStore } = makeSut()
        new LocalSavePurchases(cacheStore)
        expect(cacheStore.deleteCallsCount).toBe(0)
    })

    //Garantir que antes de salvar o cache, ele limpe o cache atual
    test('Should delete old cache on sut.save', async () => {
        const { cacheStore, sut } = makeSut()
        await sut.save(mockPurchase())
        expect(cacheStore.deleteCallsCount).toBe(1)
        //Precisa da chave correta para deletar o cache
        expect(cacheStore.deleteKey).toBe('purchases')
    })

    //Nao insere cache se o delete falhar
    test('Should not insert new Cache if delete fails', () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateDeleteError()
        const promise = sut.save(mockPurchase())
        expect(cacheStore.insertCallsCount).toBe(0)
        expect(promise).rejects.toThrow()
    })

    //Garante que o insert e delete sejam chamados com  a key certa
    test('Should insert new Cache if delete succeeds', async () => {
        const { cacheStore, sut } = makeSut()
        const purchases = mockPurchase()
        await sut.save(purchases)
        expect(cacheStore.deleteCallsCount).toBe(1)
        expect(cacheStore.insertCallsCount).toBe(1)
        expect(cacheStore.insertValues).toEqual(purchases)
    })

    //Garante que o metodo vai inserir um excecao
    test('Should throw if insert throws', () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateInsertError()
        const promise = sut.save(mockPurchase())
        expect(promise).rejects.toThrow()
    })

})
