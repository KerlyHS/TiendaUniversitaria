export interface PurchaseHistoryItem {
    id: string;
    date: string;
    orderNumber: string;
    total: number;
    status: string;
    itemsCount: number;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    identification: string;
    phone: string;
    address: string;
}

export const mockUser: UserProfile = {
    id: "U-10023",
    name: "Douglas Estudiante",
    email: "douglas@cliente.unl.edu.ec",
    identification: "21341345315",
    phone: "086545645324",
    address: "Campus Universitario"
};

export const mockPurchaseHistory: PurchaseHistoryItem[] = [
    {
        id: "1",
        date: "2026-06-20T14:30:00Z",
        orderNumber: "P-20260620-001",
        total: 45.00,
        status: "COMPLETADO",
        itemsCount: 2
    },
    {
        id: "2",
        date: "2026-06-15T09:15:00Z",
        orderNumber: "P-20260615-042",
        total: 12.50,
        status: "COMPLETADO",
        itemsCount: 1
    },
    {
        id: "3",
        date: "2026-06-01T11:45:00Z",
        orderNumber: "P-20260601-118",
        total: 32.00,
        status: "COMPLETADO",
        itemsCount: 1
    }
];
