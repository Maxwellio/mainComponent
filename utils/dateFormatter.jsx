import {format, parseISO} from 'date-fns';
import {ru} from 'date-fns/locale'

export const formatDate = (date) => {
    const parsed = parseISO(date)
    return format(parsed, 'dd.MM.yyyy', {locale : ru});
};

export const getMonthName = (number) => {
    const months = ['Январь', 
                    'Февраль', 
                    'Март', 
                    'Апрель', 
                    'Май', 
                    'Июнь', 
                    'Июль', 
                    'Август', 
                    'Сентябрь', 
                    'Октябрь',
                    'Ноябрь',
                    'Декабрь'
                ]
    return months[number - 1];
}
