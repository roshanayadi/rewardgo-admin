import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import RolesPage from '@/pages/Roles/RolesPage'
import PermissionsPage from '@/pages/Permissions/PermissionsPage'

export default function AccessControlPage() {
  return (
    <div>
      <PageHeader title="Roles & Permissions" subtitle="Manage access control in one place" />

      <Card>
        <CardContent className="pt-5">
          <Tabs defaultValue="roles">
            <TabsList className="mb-5">
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="roles">
              <RolesPage embedded />
            </TabsContent>

            <TabsContent value="permissions">
              <PermissionsPage embedded />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
