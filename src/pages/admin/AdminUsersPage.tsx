import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ShieldAlert, Edit, Ban, Search, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Fetch roles (if allowed by RLS for admins)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles' as any)
        .select('*');
      
      if (rolesError && rolesError.code !== '42501') { 
        // Ignore RLS errors if they occur, just log others
        console.error("Error fetching roles:", rolesError);
      }

      const usersWithRoles = (profiles || []).map(p => ({
         ...p,
         user_roles: ((roles as any[]) || []).filter(r => r.user_id === p.user_id)
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast.error('Erro ao buscar usuários: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles' as any)
      .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id,role' });
      
    if (error) {
       toast.error('Erro ao promover usuário: ' + error.message);
    } else {
       toast.success('Usuário promovido a Admin!');
       fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-1">Busque, edite cargos e gerencie bans de jogadores.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9" 
            placeholder="Buscar por nome ou @" 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>User / @</TableHead>
                <TableHead>Nível / XP</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Carregando heróis...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum usuário encontrado.</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => {
                   const isAdmin = u.user_roles && u.user_roles.some((r: any) => r.role === 'admin');
                   return (
                     <TableRow key={u.id}>
                       <TableCell>
                         <img src={u.avatar_url || 'https://jigavhmszshkldqytxzy.supabase.co/storage/v1/object/public/avatars/default.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                       </TableCell>
                       <TableCell>
                         <div className="font-bold">{u.name}</div>
                         <div className="text-xs text-muted-foreground">@{u.username}</div>
                       </TableCell>
                       <TableCell>
                         <div className="font-bold flex items-center gap-1">Lvl {u.level}</div>
                         <div className="text-[10px] text-muted-foreground font-mono">{u.xp} XP</div>
                       </TableCell>
                       <TableCell>
                         <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded">{u.class_name || 'Iniciante'}</span>
                       </TableCell>
                       <TableCell>
                         <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${u.plan === 'free' ? 'bg-secondary text-secondary-foreground' : 'bg-orange-500/20 text-orange-400'}`}>
                            {u.plan}
                         </span>
                       </TableCell>
                       <TableCell>
                         <div className="flex gap-2">
                           <Button variant="outline" size="icon" title="Editar XP/Nível">
                             <Edit className="h-4 w-4" />
                           </Button>
                           {!isAdmin ? (
                             <Button variant="outline" size="icon" title="Promover a Admin" className="text-orange-500 hover:text-orange-400" onClick={() => handlePromoteAdmin(u.user_id)}>
                               <ShieldAlert className="h-4 w-4" />
                             </Button>
                           ) : (
                             <div className="h-9 w-9 flex justify-center items-center bg-primary/20 rounded pointer-events-none" title="É Admin"><Shield className="h-4 w-4 text-primary" /></div>
                           )}
                           <Button variant="destructive" size="icon" title="Suspender Conta">
                             <Ban className="h-4 w-4" />
                           </Button>
                         </div>
                       </TableCell>
                     </TableRow>
                   );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
