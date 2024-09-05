import { Text, View, Image, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';

export default function AboutUs({ navigation }) {
    return (
        <View style={{ flex: 1, backgroundColor: '#fff', }}>
            <Appbar.Header theme={{ colors: { background: '#fff' } }}>
                <Appbar.Action
                    icon="arrow-left"
                    onPress={() => navigation.goBack()}
                    color="#5c5c5c"
                />
                <Appbar.Content
                    title="О приложении и игрушке"
                    titleStyle={{
                        color: '#5c5c5c',
                        fontFamily: 'Comfortaa_500Medium',
                        fontSize: 16,
                        marginLeft: '9%'
                    }}
                />
            </Appbar.Header>
            <View style={styles.container}>
                <Image
                    source={require('../../../assets/Loading.png')}
                    style={{ width: 300, height: 300, resizeMode: 'contain' }}
                />
            </View>
            <View style={{ width: '100%', alignItems: 'center', marginTop: '40%' }}>
                <View style={{ marginBottom: '60%', width: '90%' }}>
                    <Text style={{ fontFamily: 'Comfortaa_500Medium', fontSize: 16, color: "#5c5c5c", textAlign: 'center' }}>
                        Версия приложение 1.0
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: '40%',
        paddingHorizontal: '3%'
    },
    button: {
        marginBottom: '2%',
        width: '90%',
        backgroundColor: '#fff',
        borderColor: '#d9d9d9',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 10,
    }
});