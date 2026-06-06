from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Queue
from .serializers import QueueSerializer
from django.http import JsonResponse

@api_view(['GET'])
def get_queue(request):
    queue = Queue.objects.all().order_by('token_number')
    serializer = QueueSerializer(queue, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_customer(request):

    last_customer = Queue.objects.order_by('-token_number').first()

    next_token = 1

    if last_customer:
        next_token = last_customer.token_number + 1

    data = request.data.copy()
    data['token_number'] = next_token

    serializer = QueueSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


@api_view(['GET'])
def home(request):
    return JsonResponse({
        "message": "Barber Queue System API Running"
    })    

@api_view(['DELETE'])
def reset_queue(request):
    Queue.objects.all().delete()
    return Response({'message': 'Queue reset successfully'})   

@api_view(['DELETE'])
def delete_customer(request, id):
    Queue.objects.get(id=id).delete()

    return JsonResponse({
        "message": "Deleted Successfully"
    })    


@api_view(['PATCH'])
def update_status(request, id):
    try:
        customer = Queue.objects.get(id=id)
    except Queue.DoesNotExist:
        return Response(
            {"error": "Customer not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    new_status = request.data.get('status')

    if new_status not in ['WAITING', 'IN_PROGRESS', 'DONE']:
        return Response(
            {"error": "Invalid status"},
            status=status.HTTP_400_BAD_REQUEST
        )

    customer.status = new_status
    customer.save()

    serializer = QueueSerializer(customer)

    return Response(serializer.data)