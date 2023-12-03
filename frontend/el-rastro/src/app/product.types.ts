interface Rate {
	value: number
}
interface UserInterface {
    _id: string;
    username: string;
    image: string;
}

interface BidInterface {
    _id: string;
    amount: number;
    bidder: UserInterface;
}

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    initialPrice: number;
    initialDate: Date;
    closeDate: Date;
    weight: number;
    owner: UserInterface;
    bids: BidInterface[];
}

interface ProductInterface {
    product: Product;
    image: string;
    activeOwner: string;
}

export type { ProductInterface, BidInterface, UserInterface, Product, Rate };