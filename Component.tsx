import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  attributes: string[];
  images: string[];
  shortDescription: string;
  addedToCart: boolean;
  createdAt: Date;
  price: number;
}

interface ApiResponse {
  products: Product[];
}

const BASE_URL = "https://example.com/api";

const api = async (path: string, data?: any) => {
  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

const Component = () => {
  // any использовать плохая практика и лучше этого избегать. Лучше сделать типизацию интерфейса
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getProductsFromApi = async () => {
      const response: ApiResponse = await api("/products");
      setProducts(
        response.products.map((product) => ({ ...product, addedToCart: false }))
      );
    };

    getProductsFromApi();
  }, []);

  //   addToCart мутирует стэйт. это плохая практика. Лучше копировать объект и уже к нему добавлять новое свойство
  const addToCart = async (product: Product): Promise<void> => {
    // Promise необходимо обернуть в try { }, catch { }, чтоб обработать возможную ошибку
    try {
      //   api используется, но самой функции нет
      await api("/add-to-cart", { product });
      setProducts((prevProducts) =>
        prevProducts.map((prevProduct) =>
          prevProduct.id === product.id
            ? { ...prevProduct, addedToCart: true }
            : prevProduct
        )
      );
    } catch (error) {
      console.error("Error add product: ", error);
    }
  };

  //   добавил условие
  if (!products) return null;

  return (
    // необходимо products.map…. обернуть в {}, а {} необходимо обернуть в <></>
    <>
      {products?.map((product) => (
        // если в map используются фигурные скобки, то необходимо слово return, если без return, то нужны круглые скобки
        // пропущен атрибут key={...}
        <div key={product.id} className="product">
          <div className="header">
            <p>
              {product.name} <small>{product.createdAt.toLocaleString()}</small>
            </p>
            <button onClick={() => addToCart(product)} type="button">
              {product.addedToCart ? "Buy again" : "Buy"}
            </button>
          </div>
          <div className="body">
            <p>{product.description}</p>
            <p>{product.attributes}</p>
            {product.images.map((url) => (
              // пропущен атрибут key={...}
              <img key={url} src={url} alt={product.name} />
            ))}
          </div>
          <div className="footer">
            <p>{product.shortDescription}</p>
            {product.price}
            <button onClick={() => addToCart(product)} type="button">
              {product.addedToCart ? "Buy again" : "Buy"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
};
