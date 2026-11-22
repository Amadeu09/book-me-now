import { Redirect } from 'expo-router';

/** El perfil antic s'ha repartit entre Inici i Configuració. */
export default function Profile() {
    return <Redirect href="/inici" />;
}
