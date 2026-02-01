import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Home,
  Bed,
  Bath,
  Wifi,
  Tv,
  ChefHat,
  Calendar,
  Phone,
  Waves,
} from "lucide-react";

type Property = {
  id: string; // รหัสอสังหาริมทรัพย์
  title: string; // ชื่ออสังหาริมทรัพย์
  description: string | null;
  floor: string; // จำนวนชั้น
  price: number; // ราคา
  address: string; // ที่อยู่
  image: string | null; // URL รูปภาพ
  nearby_area: string | null; // พื้นที่ใกล้เคียง
};

type User = {
  id: string; // รหัสผู้ใช้
  name: string | null; // ชื่อ
  email: string; // อีเมล
  image: string | null; // URL รูปโปรไฟล์
};

// ฟังก์ชันสำหรับดึงข้อมูลอสังหาริมทรัพย์จาก API ตาม ID
async function getProperty(id: string): Promise<Property | null> {
  try {
    // เรียก API เพื่อดึงข้อมูลอสังหาริมทรัพย์
    const res = await fetch(`http://localhost:4000/properties/${id}`, {
      cache: "no-store", // ไม่ใช้ cache เพื่อให้ได้ข้อมูลล่าสุด
    });

    // ถ้า response ไม่สำเร็จ ให้ return null
    if (!res.ok) {
      return null;
    }

    // แปลง response เป็น JSON และ return
    return (await res.json()) as Property;
  } catch (error) {
    // จัดการ error และ return null
    console.error("Error fetching property:", error);
    return null;
  }
}

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้จาก API ตาม ID
async function getUser(id: string): Promise<User | null> {
  try {
    // เรียก API เพื่อดึงข้อมูลผู้ใช้
    const res = await fetch(`http://localhost:4000/users/${id}`, {
      cache: "no-store", // ไม่ใช้ cache เพื่อให้ได้ข้อมูลล่าสุด
    });

    // ถ้า response ไม่สำเร็จ ให้ return null
    if (!res.ok) {
      return null;
    }

    // แปลง response เป็น array และ return user แรก
    const users = (await res.json()) as User[];
    return users[0] || null;
  } catch (error) {
    // จัดการ error และ return null
    console.error("Error fetching user:", error);
    return null;
  }
}

// คอมโพเนนต์หลักสำหรับแสดงรายละเอียดอสังหาริมทรัพย์
export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ดึง ID จาก URL parameters
  const { id } = await params;

  // ดึงข้อมูลอสังหาริมทรัพย์จาก API
  const property = await getProperty(id);

  // ถ้าไม่พบข้อมูลอสังหาริมทรัพย์ แสดงหน้า error
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            ไม่พบข้อมูลอสังหาริมทรัพย์
          </h1>
          <p className="text-gray-600">กรุณาตรวจสอบ URL อีกครั้ง</p>
        </div>
      </div>
    );
  }

  // ดึงข้อมูลผู้ใช้ทั้งหมด (ปัจจุบันใช้ user แรกเป็น placeholder)
  const users = await fetch("http://localhost:4000/users", {
    cache: "no-store",
  })
    .then((res) => res.json() as Promise<User[]>)
    .catch(() => [] as User[]);

  // เลือกตัวแทนขาย (ใช้ user แรก)
  const agent = users[0] || null;

  // ฟังก์ชันสำหรับจัดรูปแบบราคาเป็นสกุลเงินบาท
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Container หลักสำหรับเนื้อหาทั้งหมด */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ส่วนหัว: ชื่ออสังหาริมทรัพย์และปุ่มการกระทำ */}
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl font-bold text-gray-900">{property.title}</h1>
          {/* ปุ่มการกระทำ: ถูกใจ, แสดงความคิดเห็น, แชร์, ตัวเลือกเพิ่มเติม */}
          <div className="flex gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Heart className="w-6 h-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MessageCircle className="w-6 h-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Share2 className="w-6 h-6 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreHorizontal className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* แท็กแสดงประเภทอสังหาริมทรัพย์ */}
        <div className="flex gap-2 mb-6">
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            House
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            รูปแบบเช่า
          </span>
        </div>

        {/* Grid layout: 2 คอลัมน์สำหรับเนื้อหาหลัก, 1 คอลัมน์สำหรับ sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* รูปภาพหลักของอสังหาริมทรัพย์ */}
            <div className="mb-8 rounded-lg overflow-hidden bg-gray-100">
              {property.image ? (
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-500p object-cover"
                />
              ) : (
                <div className="w-full h-500 flex items-center justify-center text-gray-400">
                  ไม่มีรูปภาพ
                </div>
              )}
            </div>

            {/* รายละเอียดอสังหาริมทรัพย์ */}
            <div className="mb-8">
              {/* ชื่ออสังหาริมทรัพย์ */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {property.title}
              </h2>
              {/* ราคา */}
              <p className="text-3xl font-bold text-gray-900 mb-6">
                {formatPrice(property.price)}
              </p>

              {/* คุณสมบัติหลัก: พื้นที่, จำนวนห้องนอน, จำนวนห้องน้ำ */}
              <div className="flex gap-6 mb-6 pb-6">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">0 ตร.ม.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">0 Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">0 Bath</span>
                </div>
              </div>

              {/* คำอธิบายอสังหาริมทรัพย์ */}
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* ส่วนแสดงสิ่งอำนวยความสะดวก */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">
                  สิ่งอำนวยความสะดวก
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* สิ่งอำนวยความสะดวกส่วนกลางของโครงการ */}
                  <div>
                    <h4 className="text-lg font-medium mb-4 text-gray-800">
                      ส่วนกลางของโครงการ
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Wifi className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">รปภ. 24 ชม.</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Waves className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">สระว่ายน้ำ</span>
                      </div>
                    </div>
                  </div>

                  {/* สิ่งอำนวยความสะดวกภายในห้อง */}
                  <div>
                    <h4 className="text-lg font-medium mb-4 text-gray-800">
                      สิ่งอำนวยความสะดวกของห้อง
                    </h4>
                    <div className="space-y-3">
                      {/* จำนวนทีวี */}
                      <div className="flex items-center gap-3">
                        <Tv className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">0 TV</span>
                      </div>
                      {/* จำนวนครัว */}
                      <div className="flex items-center gap-3">
                        <ChefHat className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">0 Kitchen</span>
                      </div>
                      {/* จำนวน WiFi */}
                      <div className="flex items-center gap-3">
                        <Wifi className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">0 Wifi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                {/* ที่อยู่และพื้นที่ใกล้เคียง */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                ที่อยู่
                 </h3>
                 <p className="text-gray-700">{property.address}</p>
                 {/* พื้นที่ใกล้เคียง */}
                  {property.nearby_area && (
                 <p className="text-gray-600 mt-1"> {property.nearby_area}</p>
                  )}
            </div>
          </div>

          {/* Sidebar: ส่วนแสดงข้อมูลตัวแทนขายและปุ่มติดต่อ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 ">
              {/* โปรไฟล์ตัวแทนขาย */}
              <div className="flex items-center gap-4 mb-6">
                {/* รูปโปรไฟล์: ถ้ามีรูปให้แสดงรูป, ถ้าไม่มีให้แสดงตัวอักษรแรก */}
                {agent.image ? (
                  <img
                    src={agent.image}
                    alt={agent.name || "Agent"}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-xl font-semibold">
                      {(agent.name || agent.email)[0].toUpperCase()}
                    </span>
                  </div>
                )}
                {/* ชื่อและอีเมล */}
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {agent.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{agent.email}</p>
                </div>
              </div>

              {/* สถิติ: จำนวนอสังหาริมทรัพย์, จำนวนไลค์, จำนวนผู้ดู */}
              <div className="flex justify-around py-4 mb-6">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Property</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Like</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Viewer</p>
                </div>
              </div>

              {/* ปุ่มการกระทำ: นัดดูห้องและติดต่อ */}
              <div className="space-y-3">
                {/* ปุ่มนัดดูห้อง */}
                <button className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>นัดดูห้อง</span>
                </button>
                {/* ปุ่มติดต่อ */}
                <button className="w-full py-3 px-4 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>Contact</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
