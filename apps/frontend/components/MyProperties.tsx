import { useEffect, useState } from "react";
import { myPropertiesService } from "@/services/client/property";
import { useRouter } from "next/navigation";

const MyProperties = () => {
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMyProperties = async () => {
      const response = await myPropertiesService();
      setMyProperties(response);
    };
    fetchMyProperties();
  }, []);


  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => router.push("/properties/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ประกาศขาย
        </button>
      </div>
      {myProperties.map((property: any) => (
        <div key={property.id} className="border p-4 rounded shadow mb-4">
          <h1 className="text-xl font-bold">{property.title}</h1>
          <p>{property.description}</p>
          <p>ราคา: {property.price}</p>
          <p>ที่อยู่: {property.address}</p>
          <p>ประเภท: {property.type}</p>
          <p>สถานะ: {property.status}</p>

          <div className="mt-4">
            <button
              onClick={() => router.push(`/properties/${property.id}/edit`)}
              className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              แก้ไข
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyProperties;
