type Property = {
  id: string;
  title: string;
  description: string | null;
  floor: string;
  price: number;
  address: string;
  image: string | null;
};

async function getProperties(): Promise<Property[]> {
  const res = await fetch("http://localhost:4000/properties", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch properties: ${res.status}`);
  }

  return (await res.json()) as Property[];
}

export default async function HomePage() {
  const properties = await getProperties();

  return (
    
      <div>
        {properties.map((p) => (
          <div key={p.id}>
            <div>
              {p.image ? <img src={p.image} alt={p.title} /> : <div>ไม่มีรูป</div>}
            </div>

            <div>{p.description ?? "ไม่มีคำอธิบาย"}</div>
            <div>ราคา: {Intl.NumberFormat("th-TH").format(p.price)} บาท</div>
            <div>{p.address}</div>
          </div>
        ))}
      </div>
  
  );
}


