import Link from "next/link";
import { Building2, Facebook, Instagram, Linkedin, Mail, Phone, Twitter, MapPin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-[#0a0a0f] border-t border-white/5 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-1 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0a0a0f] font-black italic text-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                E
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">
                                Estate<span className="text-amber-500">Pro</span>
                            </span>
                        </Link>
                        <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs">
                            ยกระดับการค้นหาอสังหาริมทรัพย์ด้วยเทคโนโลยีที่ทันสมัยที่สุด 
                            เราพร้อมช่วยเหลือคุณในทุกขั้นตอนเพื่อบ้านในฝัน
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">เมนูแนะนำ</h4>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-white/40 hover:text-amber-500 text-sm transition-colors">หน้าหลัก</Link></li>
                            <li><Link href="/properties" className="text-white/40 hover:text-amber-500 text-sm transition-colors">รายการอสังหาฯ</Link></li>
                            <li><Link href="/profile" className="text-white/40 hover:text-amber-500 text-sm transition-colors">โปรไฟล์ของฉัน</Link></li>
                            <li><Link href="/properties/new" className="text-white/40 hover:text-amber-500 text-sm transition-colors">ลงประกาศ</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-6">ข้อมูลเพิ่มเติม</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-white/40 hover:text-amber-500 text-sm transition-colors">เกี่ยวกับเรา</Link></li>
                            <li><Link href="#" className="text-white/40 hover:text-amber-500 text-sm transition-colors">ข้อตกลงและเงื่อนไข</Link></li>
                            <li><Link href="#" className="text-white/40 hover:text-amber-500 text-sm transition-colors">นโยบายความเป็นส่วนตัว</Link></li>
                            <li><Link href="#" className="text-white/40 hover:text-amber-500 text-sm transition-colors">ติดต่อสอบถาม</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-white font-bold mb-6">ติดต่อเรา</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="text-white/40 text-sm pt-1.5 focus:text-white transition-colors">02-123-4567</span>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-white/40 text-sm pt-1.5 transition-colors">contact@estatepro.co.th</span>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/30 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-white/40 text-sm pt-1.5 leading-relaxed">
                                    ชั้น 25 อาคารอาคารอโศกทาวเวอร์ส<br />
                                    แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-xs">
                        &copy; {new Date().getFullYear()} EstatePro. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-white/30 hover:text-white text-xs transition-colors">Privacy Policy</Link>
                        <Link href="#" className="text-white/30 hover:text-white text-xs transition-colors">Terms of Service</Link>
                        <Link href="#" className="text-white/30 hover:text-white text-xs transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
