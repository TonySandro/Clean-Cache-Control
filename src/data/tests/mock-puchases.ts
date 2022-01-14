import { SavePurchases } from "@/domain/usecases";

export const mockPurchase = (): Array<SavePurchases.params> => [{
    id: '1',
    date: new Date(),
    value: 50
}, {
    id: '2',
    date: new Date(),
    value: 70
}]